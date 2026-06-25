import React from 'react';

const ProductDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Placeholder */}
      <header className="bg-white shadow p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">UrabaMarket</h1>
          {/* Add navigation, search, etc. here later */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 mt-4">
        {/* Breadcrumbs Placeholder */}
        <div className="text-sm text-gray-600 mb-4">
          Home &gt; Category &gt; Product Name
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col lg:flex-row gap-6">
          {/* Left: Product Images Placeholder */}
          <div className="lg:w-1/2">
            <div className="bg-gray-200 h-96 flex items-center justify-center text-gray-500 rounded-lg">
              Product Image Gallery
            </div>
          </div>

          {/* Right: Product Details and Actions Placeholder */}
          <div className="lg:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold">Product Title</h2>
            <div className="text-sm text-gray-500">
              Rating & Reviews Placeholder
            </div>
            <div className="text-4xl font-bold text-red-600">
              $9.99 <span className="text-lg text-gray-500 line-through">$19.99</span>
            </div>
            <p className="text-green-600 font-semibold">Envío gratis</p>
            
            {/* Options Placeholder */}
            <div>
              <h3 className="font-semibold mb-2">Color:</h3>
              <div className="flex gap-2">
                <span className="border p-2 rounded-md">Red</span>
                <span className="border p-2 rounded-md">Blue</span>
              </div>
            </div>

            {/* Quantity and Add to Cart Placeholder */}
            <div className="flex items-center gap-4">
              <input type="number" defaultValue="1" min="1" className="border rounded-md p-2 w-20" />
              <button className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700">
                Añadir al carrito
              </button>
            </div>

            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 mt-2">
              Comprar ahora
            </button>

            <p className="text-gray-700 mt-4">
              Descripción breve del producto Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>

        {/* Detailed Description/Reviews/Related Products Placeholders */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-bold mb-4">Detalles del Producto</h3>
          <p>Aquí irá la descripción detallada, especificaciones, etc.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-bold mb-4">Opiniones de Clientes</h3>
          <p>Aquí irán las opiniones de los clientes.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-2xl font-bold mb-4">Productos Relacionados</h3>
          <p>Aquí irán los productos relacionados.</p>
        </div>
      </main>

      {/* Footer Placeholder */}
      <footer className="bg-gray-800 text-white p-6 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2026 UrabaMarket. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailsPage;