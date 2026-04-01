import { useParams } from "react-router-dom";

export function ConfiguratorPage() {
  const { saleOrderLineId } = useParams();

  return (
    <main>
      <h1>Configurador de diseño</h1>
      <p>Línea de venta: {saleOrderLineId}</p>
    </main>
  );
}