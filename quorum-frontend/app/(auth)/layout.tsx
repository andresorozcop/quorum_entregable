 "use client";
 
 import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
 
 export default function AuthLayout({ children }: { children: React.ReactNode }) {
   const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
 
   return (
     <GoogleReCaptchaProvider
       reCaptchaKey={siteKey}
       language="es"
       scriptProps={{ async: true, defer: true }}
     >
       {children}
     </GoogleReCaptchaProvider>
   );
 }
 
