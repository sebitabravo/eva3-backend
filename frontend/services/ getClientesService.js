import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1/clientes/";

// Obtener lista de clientes
export const obtenerClientes = async () => {
  try {
    const respuesta = await axios.get(API_URL);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener la lista de clientes:", error);
    throw error;
  }
};
