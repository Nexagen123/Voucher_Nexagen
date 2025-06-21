import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include dbprefix header
axiosInstance.interceptors.request.use(
  (config) => {
    // Add dbprefix header - using your actual database name
    const dbprefix = localStorage.getItem("dbprefix") || "fast"; // Your actual database name
    config.headers.dbprefix = dbprefix;

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const createstock = async (stockData: any) => {
  try {
    const response = await axiosInstance.post("/createstock", stockData);
    return response;
  } catch (error) {
    console.error("Stock Creation Error:", error);
    throw error;
  }
};

export const showallstock = async () => {
  try {
    const response = await axiosInstance.get("/showallstock");
    return response;
  } catch (error) {
    console.error("Stock Fetch Error:", error);
    throw error;
  }
};

// Voucher API functions
export const addVoucher = async (voucherData: any) => {
  try {
    const response = await axiosInstance.post(
      "/vouchers/addvoucher",
      voucherData
    );
    return response;
  } catch (error) {
    console.error("Voucher Creation Error:", error);
    throw error;
  }
};

export const getAllVouchers = async (params?: {
  type?: string;
  entries?: boolean;
  [key: string]: any;
}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `/vouchers/getvoucher${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await axiosInstance.get(url);
    return response;
  } catch (error) {
    console.error("Voucher Fetch Error:", error);
    throw error;
  }
};

export const getVoucherById = async (
  id: string,
  params?: { entries?: boolean; [key: string]: any }
) => {
  try {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `/vouchers/${id}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await axiosInstance.get(url);
    return response;
  } catch (error) {
    console.error("Voucher Fetch Error:", error);
    throw error;
  }
};

// Update a voucher by ID
export const updateVoucher = async (id: string, voucherData: any) => {
  try {
    const response = await axiosInstance.put(`/vouchers/${id}`, voucherData);
    return response;
  } catch (error) {
    console.error("Voucher Update Error:", error);
    throw error;
  }
};

// Account API functions
export const getAllAccounts = async () => {
  try {
    const response = await axiosInstance.get("/showallaccount");
    return response;
  } catch (error) {
    console.error("Account Fetch Error:", error);
    throw error;
  }
};

export const editGatePass = async (id: string, gatepassData: any) => {
  try {
    const response = await axiosInstance.patch(`/gatepass/${id}`, gatepassData);
    return response;
  } catch (error) {
    console.error("Edit GatePass Error:", error);
    throw error;
  }
};

export const voidGatePass = async (id: string) => {
  try {
    const response = await axiosInstance.post(`/voidgatepass/${id}`);
    return response;
  } catch (error) {
    console.error("Void Gate Pass Error:", error);
    throw error;
  }
};

export const unvoidGatePass = async (id: string) => {
  try {
    const response = await axiosInstance.post(`/unvoidgatepass/${id}`);
    return response;
  } catch (error) {
    console.error("Unvoid Gate Pass Error:", error);
    throw error;
  }
};
