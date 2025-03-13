import React, { createContext, useContext, useState } from 'react';
import { ScanState, ScanResult } from '../types';
import { scanAPI } from '../services/api';
import { useUser } from './UserContext';

interface ScanContextType extends ScanState {
  scanLabel: (
    imageBase64: string,
    productName?: string,
    productCategory?: string,
    barcode?: string
  ) => Promise<ScanResult>;
  analyzeIngredients: (text: string) => Promise<ScanResult>;
  clearCurrentScan: () => void;
}

const initialState: ScanState = {
  recentScans: [],
  currentScan: null,
  loading: false,
  error: null
};

const ScanContext = createContext<ScanContextType>({
  ...initialState,
  scanLabel: async () => ({ ingredients: [] }),
  analyzeIngredients: async () => ({ ingredients: [] }),
  clearCurrentScan: () => {}
});

export const useScan = () => useContext(ScanContext);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ScanState>(initialState);
  
  const scanLabel = async (
    imageBase64: string,
    productName?: string,
    productCategory?: string,
    barcode?: string
  ): Promise<ScanResult> => {
    try {
      setState({
        ...state,
        loading: true,
        error: null
      });
      
      const result = await scanAPI.scanLabel(
        imageBase64,
        productName,
        productCategory,
        barcode
      );
      
      // Add to recent scans
      const updatedScans = [result, ...state.recentScans].slice(0, 10); // Keep only 10 most recent
      
      setState({
        recentScans: updatedScans,
        currentScan: result,
        loading: false,
        error: null
      });
      
      return result;
    } catch (error) {
      console.error('Error scanning label:', error);
      setState({
        ...state,
        loading: false,
        error: 'Failed to scan label'
      });
      throw error;
    }
  };
  
  const analyzeIngredients = async (text: string): Promise<ScanResult> => {
    try {
      setState({
        ...state,
        loading: true,
        error: null
      });
      
      const ingredients = await scanAPI.analyzeIngredients(text);
      const result: ScanResult = { ingredients };
      
      setState({
        ...state,
        currentScan: result,
        loading: false,
        error: null
      });
      
      return result;
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      setState({
        ...state,
        loading: false,
        error: 'Failed to analyze ingredients'
      });
      throw error;
    }
  };
  
  const clearCurrentScan = () => {
    setState({
      ...state,
      currentScan: null
    });
  };
  
  return (
    <ScanContext.Provider
      value={{
        ...state,
        scanLabel,
        analyzeIngredients,
        clearCurrentScan
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};
