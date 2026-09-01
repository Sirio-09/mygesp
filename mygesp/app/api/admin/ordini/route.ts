import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("Errore recupero ordini:", err);
    return NextResponse.json({ error: err.message || "Errore del server" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const { orderId, status, trackingCode, carrier } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    // 1. Aggiorna lo stato nel database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    // 2. Se lo stato diventa "shipped", invia l'email al cliente via Resend
    if (status === "shipped" && updatedOrder.customerEmail && process.env.RESEND_API_KEY) {
      const itemsHtml = updatedOrder.items
        .map(
          (item) => `
          <li style="margin-bottom: 6px;">
            <strong>${item.variant.product.name}</strong> (Taglia: ${item.variant.size}) - Qta: ${item.quantity}
          </li>
        `
        )
        .join("");

      const trackingHtml = trackingCode
        ? `
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #111;">Dettagli di Tracciamento:</p>
            <p style="margin: 4px 0 0 0; color: #4b5563;">Corriere: <strong>${carrier || "Standard"}</strong></p>
            <p style="margin: 4px 0 0 0; color: #4b5563;">Codice Tracking: <strong style="font-family: monospace;">${trackingCode}</strong></p>
          </div>
        `
        : `
          <p style="color: #6b7280; font-style: italic;">
            Il tuo pacco è stato affidato al corriere espresso e ti verrà consegnato nei prossimi giorni lavorativi.
          </p>
        `;

      try {
        await resend.emails.send({
          from: "MyGesp <onboarding@resend.dev>",
          to: updatedOrder.customerEmail,
          subject: `🚚 Il tuo ordine #${updatedOrder.id.slice(-8).toUpperCase()} è stato spedito!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 24px; border-radius: 8px;">
              <h2 style="color: #111; margin-top: 0;">Il tuo ordine è in viaggio! 📦</h2>
              <p>Ciao <strong>${updatedOrder.shippingName || "Cliente"}</strong>,</p>
              <p>Abbiamo appena affidato la tua spedizione al corriere.</p>

              ${trackingHtml}

              <h3 style="font-size: 16px; color: #222; margin-top: 24px;">Riepilogo prodotti spediti:</h3>
              <ul style="padding-left: 20px; color: #4b5563;">
                ${itemsHtml}
              </ul>

              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #777; text-align: center; margin-bottom: 0;">
                Grazie per aver acquistato da MyGesp. Per informazioni puoi rispondere a questa email.
              </p>
            </div>
          `,
        });
        console.log(`✉️ Email di spedizione inviata con successo a: ${updatedOrder.customerEmail}`);
      } catch (emailErr) {
        console.error("❌ Errore durante l'invio della mail di spedizione:", emailErr);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (err: any) {
    console.error("Errore aggiornamento stato ordine:", err);
    return NextResponse.json({ error: err.message || "Errore del server" }, { status: 500 });
  }
}