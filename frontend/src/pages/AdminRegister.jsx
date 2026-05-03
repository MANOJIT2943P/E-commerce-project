import React from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiMail, FiUser, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from '../components/admin/AdminLayout';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminRegister() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await adminService.createAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      toast.success('Admin user registered successfully');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors?.[0]?.msg ?? err.message) ||
        'Failed to register admin';
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 sm:p-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 mb-4">
            <FiCheckCircle size={26} />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Register New Admin
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create a new administrator account for the unified backend.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</span>
              <div className="relative mt-2">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Doe"
                />
              </div>
              {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</span>
              <div className="relative mt-2">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
              <div className="relative mt-2">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</span>
              <div className="relative mt-2">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === watch('password') || 'Passwords must match'
                  })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-60"
          >
            {isSubmitting ? <LoadingSpinner size="small" /> : 'Register Admin'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
