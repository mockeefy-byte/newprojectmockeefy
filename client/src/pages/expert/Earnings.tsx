import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../lib/axios";
import { toast } from "sonner";

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [savingBank, setSavingBank] = useState(false);
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);
  const [pendingCredit, setPendingCredit] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const minFilter = Number(searchParams.get('min') || '0');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [earningsRes, bankRes] = await Promise.all([
          axios.get('/api/earnings'),
          axios.get('/api/earnings/bank')
        ]);

        if (earningsRes.data.success) {
          setWalletBalance(Number(earningsRes.data.walletBalance || 0));
          setPendingCredit(Number(earningsRes.data.pendingCredit || 0));
          setWithdrawals(earningsRes.data.withdrawals || []);
        }

        if (bankRes.data.success && bankRes.data.bankAccount) {
          setBankAccount(bankRes.data.bankAccount);
          setAccountNumber(bankRes.data.bankAccount.accountNumber || "");
          setIfscCode(bankRes.data.bankAccount.ifscCode || "");
          setBankName(bankRes.data.bankAccount.bankName || "");
          setAccountHolderName(bankRes.data.bankAccount.accountHolderName || "");
        }
      } catch (err: any) {
        console.error('Earnings fetch failed', err);
        toast.error(err?.response?.data?.message || 'Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [earningsRes, bankRes] = await Promise.all([
        axios.get('/api/earnings'),
        axios.get('/api/earnings/bank')
      ]);
      if (earningsRes.data.success) {
        setWalletBalance(Number(earningsRes.data.walletBalance || 0));
        setPendingCredit(Number(earningsRes.data.pendingCredit || 0));
        setWithdrawals(earningsRes.data.withdrawals || []);
      }
      if (bankRes.data.success && bankRes.data.bankAccount) {
        setBankAccount(bankRes.data.bankAccount);
      }
    } catch (err: any) {
      console.error('Refresh failed', err);
      toast.error(err?.response?.data?.message || 'Failed to refresh earnings data');
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      toast.error('Please fill all bank details.');
      return;
    }

    try {
      setSavingBank(true);
      const res = await axios.post('/api/earnings/bank', {
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
      });
      if (res.data.success) {
        setBankAccount(res.data.bankAccount);
        toast.success('Bank account saved successfully.');
      }
    } catch (err: any) {
      console.error('Save bank failed', err);
      toast.error(err?.response?.data?.message || 'Failed to save bank information');
    } finally {
      setSavingBank(false);
    }
  };

  const requestWithdrawalHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!withdrawAmount) {
      toast.error('Enter an amount to withdraw.');
      return;
    }

    try {
      setRequestingWithdrawal(true);
      const res = await axios.post('/api/earnings/withdraw', { amount: withdrawAmount });
      if (res.data.success) {
        toast.success('Withdrawal processed successfully.');
        setWithdrawAmount('');
        refreshData();
      }
    } catch (err: any) {
      console.error('Withdrawal request failed', err);
      toast.error(err?.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setRequestingWithdrawal(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!withdrawal || typeof withdrawal.amount !== 'number') return false;
    return minFilter > 0 ? withdrawal.amount >= minFilter : true;
  });

  const effectiveBalance = walletBalance || pendingCredit;
  const pendingNote = walletBalance === 0 && pendingCredit > 0;

  return (
    <div className="h-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
        {/* HEADER SECTION */}
        <div className="p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Expert Wallet</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">My Wallet</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your payouts, bank details, and withdrawal requests.</p>
            </div>
            <button
              onClick={refreshData}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* GRID LAYOUT: Left Column (Forms) & Right Column (History) */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Wallet Balance Card */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Available Wallet Balance</p>
                      <p className="mt-3 text-4xl font-bold text-slate-900">₹{effectiveBalance.toLocaleString()}</p>
                    </div>
                    <div className="rounded-3xl bg-blue-50 px-4 py-3 text-blue-700">
                      <p className="text-sm font-semibold">Ready for withdrawal</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-slate-500">
                    <p>Funds are credited after completed sessions. <span className="font-semibold text-slate-700">A 20% platform service fee applies to all earnings.</span> The balances shown here represent your 80% expert share.</p>
                    {pendingNote && (
                      <p className="text-sm text-amber-700">₹{pendingCredit.toLocaleString()} is pending credit from completed sessions.</p>
                    )}
                  </div>
                </div>

                {/* Request Withdrawal Card */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Request Withdrawal</h2>
                  <form onSubmit={requestWithdrawalHandler} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Amount</label>
                      <input
                        type="number"
                        min={500}
                        step="1"
                        value={withdrawAmount}
                        onChange={(event) => setWithdrawAmount(event.target.value)}
                        placeholder="Enter amount to withdraw (minimum ₹500)"
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Minimum withdrawal amount is ₹500. Upon withdrawal, funds will be transferred directly to your saved bank account via Razorpay Payouts.
                    </div>
                    <button
                      type="submit"
                      disabled={requestingWithdrawal || loading}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {requestingWithdrawal ? 'Processing Payout...' : 'Request Withdrawal'}
                    </button>
                  </form>
                </div>

                {/* Bank Details Card */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Saved Bank Details</h2>
                  <form onSubmit={saveBankDetails} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Account holder name</span>
                        <input
                          value={accountHolderName}
                          onChange={(event) => setAccountHolderName(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Enter account holder name"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Account number</span>
                        <input
                          value={accountNumber}
                          onChange={(event) => setAccountNumber(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Enter account number"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>IFSC code</span>
                        <input
                          value={ifscCode}
                          onChange={(event) => setIfscCode(event.target.value.toUpperCase())}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Enter IFSC code"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-700">
                        <span>Bank name</span>
                        <input
                          value={bankName}
                          onChange={(event) => setBankName(event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          placeholder="Enter bank name"
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={savingBank}
                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {savingBank ? 'Saving...' : 'Save Bank Details'}
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Latest Withdrawal Requests Card */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest Withdrawal Requests</h2>
                  {loading ? (
                    <p className="text-sm text-slate-500">Loading history...</p>
                  ) : filteredWithdrawals.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {minFilter > 0 ? `No withdrawal requests found with amount ≥ ₹${minFilter}.` : 'No withdrawal requests yet.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredWithdrawals.map((withdrawal) => (
                        <div key={withdrawal._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">₹{withdrawal.amount.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">Requested {new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${withdrawal.status === 'processed' ? 'bg-emerald-100 text-emerald-700' : withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {withdrawal.status}
                            </span>
                          </div>
                          {withdrawal.referenceId && (
                            <p className="mt-3 text-xs text-slate-500">Ref: {withdrawal.referenceId}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
