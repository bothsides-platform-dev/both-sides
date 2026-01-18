export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="w-full px-4 md:px-8 lg:px-12 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BothSides. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          A vs B, 당신의 선택은?
        </p>
      </div>
    </footer>
  );
}
