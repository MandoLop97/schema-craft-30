import { useState, useCallback, useRef } from 'react';
import { Schema } from '@/types/schema';

export function useSchemaHistory(initial: Schema) {
  const [schema, setSchemaState] = useState<Schema>(initial);
  const past = useRef<Schema[]>([]);
  const future = useRef<Schema[]>([]);

  const setSchema = useCallback((next: Schema | ((prev: Schema) => Schema)) => {
    setSchemaState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      past.current.push(JSON.parse(JSON.stringify(prev)));
      future.current = [];
      return resolved;
    });
  }, []);

  const undo = useCallback(() => {
    setSchemaState((current) => {
      if (past.current.length === 0) return current;
      future.current.push(JSON.parse(JSON.stringify(current)));
      return past.current.pop()!;
    });
  }, []);

  const redo = useCallback(() => {
    setSchemaState((current) => {
      if (future.current.length === 0) return current;
      past.current.push(JSON.parse(JSON.stringify(current)));
      return future.current.pop()!;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { schema, setSchema, undo, redo, canUndo, canRedo };
}
