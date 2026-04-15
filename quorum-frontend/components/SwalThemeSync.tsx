"use client";

// Alinea SweetAlert2 con la clase dark del documento
import { useEffect } from "react";
import Swal, { type SweetAlertOptions } from "sweetalert2";

export default function SwalThemeSync() {
  useEffect(() => {
    function sincronizar() {
      const oscuro = document.documentElement.classList.contains("dark");
      // colorScheme existe en SweetAlert2 11+; los tipos @types pueden ir atrasados
      const opts = {
        colorScheme: oscuro ? ("dark" as const) : ("light" as const),
      } as SweetAlertOptions;
      Swal.mixin(opts);
    }

    sincronizar();
    const obs = new MutationObserver(sincronizar);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return null;
}
