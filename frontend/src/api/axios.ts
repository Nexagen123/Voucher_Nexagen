import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// function to register user
export const addGatePass = async (gatepassData: any) => {
  try {
    const response = await axiosInstance.post("/gatepass", gatepassData);
    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};
export const viewGatePass = async () => {
  try {
    const response = await axiosInstance.get("/allgatepass");
    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const createcategory = async (name: string) => {
  try {
    const response = await axiosInstance.post("/createcategory", { name });
    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const showallcategory = async () => {
  try {
    const response = await axiosInstance.get("/showallcategory");
    console.log(response.data);

    return response;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

// Update gate pass status or details
export const updateGatePass = async (id: string, updateData: any) => {
  try {
    const response = await axiosInstance.put(`/gatepass/${id}`, updateData);
    return response;
  } catch (error) {
    console.error("Update GatePass Error:", error);
    throw error;
  }
};

// Update gate pass status by ID
export const updateGatePassStatus = async (id: string, status: string) => {
  try {
    // Assuming PATCH /gatepass/:id with { status }
    const response = await axiosInstance.patch(`/gatepass/${id}`, { status });
    return response;
  } catch (error) {
    console.error("Update Status Error:", error);
    throw error;
  }
};
