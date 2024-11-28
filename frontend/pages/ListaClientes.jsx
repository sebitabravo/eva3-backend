import { useState, useEffect } from "react";
import { obtenerClientes } from "./services/getClientesService";
import "./ListaClientes.css";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [estado, setEstado] = useState("");
  const [genero, setGenero] = useState("");
  const [rangoSaldo, setRangoSaldo] = useState([0, Infinity]);
  const [rangoEdad, setRangoEdad] = useState([0, 100]);
  const [nivelSatisfaccion, setNivelSatisfaccion] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1); // Página actual
  const [clientesPorPagina, setClientesPorPagina] = useState(50); // Número de clientes por página

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
        setClientesFiltrados(data);
      } catch (err) {
        setError("No se pudo cargar la lista de clientes");
      }
    };
    fetchClientes();
  }, []);

  // Manejador para aplicar filtros
  const aplicarFiltros = () => {
    let filtrados = [...clientes];

    if (estado !== "") {
      filtrados = filtrados.filter((cliente) =>
        estado === "Activo" ? cliente.active : !cliente.active
      );
    }

    if (genero !== "") {
      filtrados = filtrados.filter(
        (cliente) => cliente.genero.toLowerCase() === genero.toLowerCase()
      );
    }

    filtrados = filtrados.filter(
      (cliente) =>
        cliente.saldo >= rangoSaldo[0] && cliente.saldo <= rangoSaldo[1]
    );

    filtrados = filtrados.filter(
      (cliente) => cliente.edad >= rangoEdad[0] && cliente.edad <= rangoEdad[1]
    );

    if (nivelSatisfaccion !== "") {
      filtrados = filtrados.filter(
        (cliente) =>
          cliente.nivel_de_satisfaccion === parseInt(nivelSatisfaccion)
      );
    }

    setClientesFiltrados(filtrados);
    setPaginaActual(1); // Reiniciar a la primera página después de aplicar filtros
  };

  // Función para manejar el cambio de página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Calcular el índice de inicio y fin para la paginación
  const indiceFinal = paginaActual * clientesPorPagina;
  const indiceInicio = indiceFinal - clientesPorPagina;
  const clientesParaMostrar = clientesFiltrados.slice(
    indiceInicio,
    indiceFinal
  );

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="contenedor-listado-clientes">
      <h1>Listado de Clientes</h1>

      {/* Filtros */}
      <div className="filtros">
        <label>
          Estado:
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </label>
        <label>
          Género:
          <select value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">Todos</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </label>
        <label>
          Rango de Saldo:
          <input
            type="number"
            placeholder="Mínimo"
            onChange={(e) =>
              setRangoSaldo([+e.target.value || 0, rangoSaldo[1]])
            }
          />
          <input
            type="number"
            placeholder="Máximo"
            onChange={(e) =>
              setRangoSaldo([rangoSaldo[0], +e.target.value || Infinity])
            }
          />
        </label>
        <label>
          Rango de Edad:
          <input
            type="number"
            placeholder="Mínimo"
            onChange={(e) => setRangoEdad([+e.target.value || 0, rangoEdad[1]])}
          />
          <input
            type="number"
            placeholder="Máximo"
            onChange={(e) =>
              setRangoEdad([rangoEdad[0], +e.target.value || 100])
            }
          />
        </label>
        <label>
          Nivel de Satisfacción:
          <select
            value={nivelSatisfaccion}
            onChange={(e) => setNivelSatisfaccion(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="1">Muy insatisfecho</option>
            <option value="2">Insatisfecho</option>
            <option value="3">Normal</option>
            <option value="4">Satisfecho</option>
            <option value="5">Muy satisfecho</option>
          </select>
        </label>
        <button onClick={aplicarFiltros}>Aplicar Filtros</button>
      </div>

      {/* Tabla */}
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Edad</th>
            <th>Género</th>
            <th>Saldo</th>
            <th>Activo</th>
            <th>Satisfacción</th>
          </tr>
        </thead>
        <tbody>
          {clientesParaMostrar.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.cliente_id}</td>
              <td>{cliente.edad}</td>
              <td>{cliente.genero}</td>
              <td>{cliente.saldo}</td>
              <td>{cliente.active ? "Sí" : "No"}</td>
              <td>{cliente.nivel_de_satisfaccion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="paginacion">
        {paginaActual > 1 && (
          <button onClick={() => cambiarPagina(paginaActual - 1)}>
            Anterior
          </button>
        )}
        <span>
          Página {paginaActual} de {totalPaginas}
        </span>
        {paginaActual < totalPaginas && (
          <button onClick={() => cambiarPagina(paginaActual + 1)}>
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

export default ListaClientes;
