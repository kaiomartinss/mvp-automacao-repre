export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0C0D0F] text-[#F4F4F5] relative selection:bg-white selection:text-[#0C0D0F]">
      {children}
    </div>
  );
}
