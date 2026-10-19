
// Fix: Import React to make the React namespace available.
import React, { useState, useEffect } from 'react';

function usePersistentState<T>(
  storageKey: string, 
  defaultValue: T, 
  migration?: (data: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue) {
        let parsedValue = JSON.parse(storedValue);
        if (migration) {
          parsedValue = migration(parsedValue);
        }
        return parsedValue;
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${storageKey}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${storageKey}":`, error);
    }
  }, [storageKey, value]);

  return [value, setValue];
}

export default usePersistentState;