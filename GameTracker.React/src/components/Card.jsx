import React from 'react';

export default function Card({ title, value, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-2 text-sm text-gray-600">{children}</div>
    </div>
  )
}
