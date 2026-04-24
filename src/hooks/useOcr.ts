import { useCallback, useState } from 'react';
import { recognizeText } from '../services/ocr';

export function useOcr() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (imageUri: string) => {
    setLoading(true);
    try {
      return await recognizeText(imageUri);
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading };
}
