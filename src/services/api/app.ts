import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL;

// Definição da URL base da API
const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  

// Definição do tipo para um item
export interface Item {
  name: string;
  price: number;
}

// Função para buscar itens (GET)
export const getItems = async (): Promise<Item[]> => {
  try {
    const response = await api.get<Item[]>("/items");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    throw error;
  }
};

// Função para criar um novo item (POST)
export const createItem = async (item: Item): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>("/items", item);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar item:", error);
    throw error;
  }
};

export default api;