import Header from "@/components/header";

export default function RootLayout({ children }) {
  return (
    <>
      <header />
      {children}
    </>
  );
}
