"use client";
export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (<div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/70 p-4" onClick={onClose}>
    <div className="card max-h-[92vh] w-full max-w-md overflow-auto" onClick={(e) => e.stopPropagation()}>{children}</div></div>);
}
