import type { AuthResult, LoginData, SignupData } from '@/types/auth';

export async function loginUser(data: LoginData): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }

  if (data.email === 'admin@example.com' && data.password === 'admin123') {
    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
    };
  } else if (
    data.email === 'user@example.com' &&
    data.password === 'password'
  ) {
    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
      },
    };
  } else {
    return { error: 'Invalid email or password' };
  }
}

export async function signupUser(data: SignupData): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!data.name || !data.email || !data.password || !data.confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (data.password !== data.confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  return {
    success: true,
    message: 'Account created successfully! Please log in.',
  };
}
