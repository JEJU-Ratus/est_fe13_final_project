import Header from "@/components/header";

export default function SiteLayout({ children }) {
  return ( 
      <body>
        <Header />
        {children}
      </body>
  );
}
