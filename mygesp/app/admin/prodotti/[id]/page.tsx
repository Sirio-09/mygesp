import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8 selection:bg-grass selection:text-white">
      <div className="max-w-4xl mx-auto">
        <EditProductForm product={product} />
      </div>
    </main>
  );
}