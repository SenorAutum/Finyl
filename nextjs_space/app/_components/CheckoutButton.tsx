'use client'; // Required for Next.js app router since we use state

import { useState } from 'react';

// We pass the moduleId and userId as props from whatever page renders this button
interface CheckoutProps {
  moduleId: string;
  userId: string;
}

export default function CheckoutButton({ moduleId, userId }: CheckoutProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    // Basic validation to ensure they typed something
    if (!phone || phone.length < 9) {
      setMessage('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          moduleId: moduleId,
          userId: userId, 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("✅ Prompt sent! Check your phone and enter your M-Pesa PIN.");
        // We now have data.checkoutRequestID if we need it!
      } else {
        setMessage(`❌ Payment failed to initiate: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm p-6 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-800">Unlock Module {moduleId}</h3>
      <p className="text-sm text-gray-500">Pay Ksh 100 via M-Pesa</p>
      
      <input 
        type="text" 
        placeholder="Enter M-Pesa Number (e.g. 07...)" 
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={loading}
      />
      
      <button 
        onClick={handlePayment} 
        disabled={loading}
        className={`p-3 rounded-md text-white font-bold transition-all ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Sending Prompt...' : 'Pay with M-Pesa'}
      </button>

      {message && (
        <p className={`text-sm mt-2 ${message.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}