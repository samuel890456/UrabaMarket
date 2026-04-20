import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { authRouter } from "./auth.routes.js";
import { carritoRouter } from "./carrito.routes.js";
import { categoriaRouter } from "./categoria.routes.js";
import { compraProveedorRouter } from "./compraProveedor.routes.js";
import { direccionRouter } from "./direccion.routes.js";
import { healthRouter } from "./health.routes.js";
import { pedidoRouter } from "./pedido.routes.js";
import { productoRouter } from "./producto.routes.js";
import { resenaRouter } from "./resena.routes.js";
import { tiendaRouter } from "./tienda.routes.js";
import { usuarioRouter } from "./usuario.routes.js";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    ok: true,
    data: { name: "UrabaMarket API", version: "1.0.0" }
  });
});

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/usuarios", usuarioRouter);
apiRouter.use("/categorias", categoriaRouter);
apiRouter.use("/direcciones", direccionRouter);
apiRouter.use("/tiendas", tiendaRouter);
apiRouter.use("/productos", productoRouter);
apiRouter.use("/carrito", carritoRouter);
apiRouter.use("/pedidos", pedidoRouter);
apiRouter.use("/compras-proveedor", compraProveedorRouter);
apiRouter.use("/resenas", resenaRouter);
apiRouter.use("/admin", adminRouter);
