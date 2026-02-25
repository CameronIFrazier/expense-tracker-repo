import "./App.css";
import { useState, useEffect } from "react";
import { callChatGPT } from "./utils/chatgpt";

function App() {
  const [reoccuringExpenseDetails, setreoccuringExpenseDetails] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [notes, setnotes] = useState("One Time Payment");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openreoccuringExpenseDetails = () => setreoccuringExpenseDetails(true);
  const closereoccuringExpenseDetails = () => setreoccuringExpenseDetails(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/expenses");
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };
    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const recurringCount = expenses.filter(e => e.notes !== "One Time Payment").length;

  const handleAPI = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const formattedExpenses = expenses
      .map((exp, index) => `${index + 1}. ${exp.name} - $${exp.amount} on ${new Date(exp.date).toLocaleDateString()} (${exp.notes})`)
      .join("\n");

    const systemMessage = { role: "system", content: `The user has the following expenses:\n${formattedExpenses}` };
    const newMessages = [systemMessage, ...messages, { role: "user", content: input }];
    setMessages(newMessages);

    const reply = await callChatGPT(newMessages);
    setMessages([...newMessages, { role: "assistant", content: reply }]);
    setResponse(reply);
    setInput("");
    setIsLoading(false);
  };

  const handleClearExpenses = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all expenses?");
    if (!confirmClear) return;
    try {
      const response = await fetch("http://localhost:3001/api/expenses/clear", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear expenses table");
      const updatedResponse = await fetch("http://localhost:3001/api/expenses");
      const updatedData = await updatedResponse.json();
      setExpenses(updatedData);
    } catch (err) {
      console.error("Error clearing expenses:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || !date || !notes) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, date, notes }),
      });
      await response.json();
      setName(""); setAmount(""); setDate(""); setnotes("One Time Payment");
      setreoccuringExpenseDetails(false);
      const updatedResponse = await fetch("http://localhost:3001/api/expenses");
      const updatedData = await updatedResponse.json();
      setExpenses(updatedData);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const getRecurringColor = (note) => {
    const map = { "Weekly": "#10b981", "Bi-Weekly": "#3b82f6", "Monthly": "#f59e0b", "Annually": "#8b5cf6", "One Time Payment": "#6b7280" };
    return map[note] || "#6b7280";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Google Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        
        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }

        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px 24px;
          backdrop-filter: blur(10px);
          transition: border-color 0.2s ease;
        }
        .stat-card:hover { border-color: rgba(16, 185, 129, 0.3); }

        .main-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
        }

        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .form-input:focus { border-color: rgba(16, 185, 129, 0.5); background: rgba(16, 185, 129, 0.04); }
        .form-input::placeholder { color: #475569; }

        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 20px;
          color: #94a3b8;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

        .btn-accent {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 7px 14px;
          color: #60a5fa;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-accent:hover { background: rgba(59, 130, 246, 0.25); }
        .btn-accent.active { background: rgba(59, 130, 246, 0.3); border-color: #3b82f6; color: white; }

        .btn-purple {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          padding: 8px 14px;
          color: #a78bfa;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-purple:hover, .btn-purple.active { background: rgba(139, 92, 246, 0.3); color: white; }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 8px 16px;
          color: #f87171;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

        .expense-row {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          gap: 12px;
        }
        .expense-row:hover { background: rgba(255,255,255,0.02); }
        .expense-row:last-child { border-bottom: none; }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
          max-width: 90%;
        }

        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .glow-green {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
          pointer-events: none;
          top: -100px;
          right: -100px;
        }
        .glow-blue {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
          pointer-events: none;
          bottom: 100px;
          left: -50px;
        }
      `}</style>

      {/* Background effects */}
      <div className="dot-grid" />
      <div className="glow-green" />
      <div className="glow-blue" />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #10b981, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>ExpenseIQ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>Live</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "28px 32px", display: "grid", gridTemplateColumns: "320px 1fr 340px", gap: 20 }}>

        {/* LEFT COLUMN — Add Expense Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="stat-card">
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Total</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#10b981" }}>${totalExpenses.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Recurring</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{recurringCount}</div>
            </div>
          </div>

          {/* Form card */}
          <div className="main-card">
            <div className="card-header">Add Expense</div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Expense Name</label>
                  <input className="form-input" type="text" placeholder="e.g. Netflix, Rent..." value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Amount ($)</label>
                  <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Recurring?</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className={`btn-accent ${reoccuringExpenseDetails ? "active" : ""}`} onClick={() => { openreoccuringExpenseDetails(); setnotes(""); }}>Yes</button>
                    <button type="button" className={`btn-secondary ${!reoccuringExpenseDetails ? "active" : ""}`} style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => { closereoccuringExpenseDetails(); setnotes("One Time Payment"); }}>One-time</button>
                  </div>
                </div>

                {reoccuringExpenseDetails && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["Weekly", "Bi-Weekly", "Monthly", "Annually"].map(freq => (
                      <button key={freq} type="button" className={`btn-purple ${notes === freq ? "active" : ""}`} onClick={() => setnotes(freq)}>{freq}</button>
                    ))}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 11, color: "#64748b", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Date</label>
                  <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ colorScheme: "dark" }} />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 4, width: "100%", padding: "11px" }}>
                  + Add Expense
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN — Expense List */}
        <div className="main-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Expenses</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Sans', sans-serif", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>{expenses.length} entries</span>
              <button className="btn-danger" onClick={handleClearExpenses}>Clear All</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 240px)" }}>
            {expenses.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "#475569", gap: 12 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span style={{ fontSize: 14 }}>No expenses yet</span>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{ display: "flex", padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 12 }}>
                  {["Name", "Amount", "Date", "Type"].map((h, i) => (
                    <div key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {expenses.map((expense) => (
                  <div key={expense.id} className="expense-row">
                    <div style={{ flex: 2, fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{expense.name}</div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#10b981" }}>${parseFloat(expense.amount).toFixed(2)}</div>
                    <div style={{ flex: 1, fontSize: 13, color: "#94a3b8" }}>{new Date(expense.date).toLocaleDateString()}</div>
                    <div style={{ flex: 1 }}>
                      <span className="badge" style={{ background: `${getRecurringColor(expense.notes)}20`, color: getRecurringColor(expense.notes), border: `1px solid ${getRecurringColor(expense.notes)}40` }}>
                        {expense.notes}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — AI Chat */}
        <div className="main-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
            </div>
            AI Financial Advisor
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 340px)" }}>
            {messages.filter(m => m.role !== "system").length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, color: "#475569", gap: 8, textAlign: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style={{ fontSize: 13 }}>Ask about your spending habits, savings tips, or financial goals</span>
              </div>
            ) : (
              messages.filter(m => m.role !== "system").map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div className="chat-bubble" style={{
                    background: msg.role === "user" ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${msg.role === "user" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                    color: msg.role === "user" ? "#bfdbfe" : "#cbd5e1"
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["Analyze my spending", "How to save more?", "Am I overspending?"].map(suggestion => (
                <button key={suggestion} onClick={() => setInput(suggestion)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
                  onMouseEnter={e => e.target.style.color = "#94a3b8"}
                  onMouseLeave={e => e.target.style.color = "#64748b"}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", resize: "none", height: 60, lineHeight: 1.5 }}
                placeholder="Ask for financial advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAPI(); }}}
              />
              <button className="btn-primary" onClick={handleAPI} disabled={isLoading} style={{ width: 44, height: 60, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default App;