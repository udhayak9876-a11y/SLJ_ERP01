import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function maskAadhar(input?: string) {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  if (digits.length < 4) return null;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { dateJoined: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (data.gstin && !gstinRegex.test(data.gstin)) {
    return NextResponse.json({ error: "Invalid GSTIN" }, { status: 400 });
  }

  const last = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
    select: { customerCode: true },
  });

  const prev = last?.customerCode?.split("-")[1];
  const nextNumber = String((prev ? Number(prev) : 0) + 1).padStart(4, "0");
  const customerCode = `CUS-${nextNumber}`;

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      name: data.name,
      phone: data.phone,
      phoneAlt: data.phoneAlt || null,
      address: data.address || "",
      city: data.city || "Tiruppur",
      state: data.state || "Tamil Nadu",
      pincode: data.pincode || "",
      gstin: data.gstin || null,
      panNumber: data.panNumber || null,
      aadharNumber: maskAadhar(data.aadharNumber),
      customerType: data.customerType || "RETAIL",
      creditLimit: Number(data.creditLimit || 0),
      openingBalance: Number(data.openingBalance || 0),
      notes: data.notes || null,
    },
  });

  return NextResponse.json(customer);
}
