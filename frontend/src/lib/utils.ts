import { clsx, type ClassValue } from 'clsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NewChatRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const id = uuidv4();
    navigate(`${id}?isNew=true`, { replace: true });
  }, [navigate]);
  return null;
}
