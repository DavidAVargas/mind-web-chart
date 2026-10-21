/**
 * Soft glows in the bubble colors that drift behind a page. Light mode needs
 * them stronger to show up against white.
 */
export default function GlowBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="animate-glow pointer-events-none absolute inset-x-0 top-0 h-[34rem] dark:hidden"
        style={{
          background:
            "radial-gradient(42rem 20rem at 10% 0%, color-mix(in oklch, #9e77ed 38%, transparent), transparent 70%), radial-gradient(36rem 18rem at 90% 6%, color-mix(in oklch, #0ea5e9 32%, transparent), transparent 70%), radial-gradient(30rem 15rem at 55% 32%, color-mix(in oklch, #10b981 22%, transparent), transparent 70%), radial-gradient(22rem 12rem at 72% 0%, color-mix(in oklch, #f43f5e 16%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="animate-glow pointer-events-none absolute inset-x-0 top-0 hidden h-[28rem] opacity-40 dark:block"
        style={{
          background:
            "radial-gradient(40rem 18rem at 12% 0%, color-mix(in oklch, #9e77ed 22%, transparent), transparent 70%), radial-gradient(34rem 16rem at 88% 8%, color-mix(in oklch, #0ea5e9 18%, transparent), transparent 70%), radial-gradient(30rem 14rem at 55% 30%, color-mix(in oklch, #10b981 12%, transparent), transparent 70%)",
        }}
      />
    </>
  );
}
