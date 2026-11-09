import { useState, useEffect } from 'react'
import './App.css'

// The categories you can choose from
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other']

// Helper: always show money like $12.50
function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`
}

// Helper: show date in a friendly way, e.g. Nov 9, 2026
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function App() {
  // All expenses stored in state: [{ id, name, amount, category, date }]
  const [expenses, setExpenses] = useState(() => {
    // Load saved expenses from localStorage when the app first starts
    try {
      const saved = localStorage.getItem('expenses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Form fields
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  // Default the date to today
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')

  // Save expenses to localStorage every time they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  // Totals (recalculated automatically whenever expenses change)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const numberOfExpenses = expenses.length

  const now = new Date()
  const thisMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + Number(e.amount), 0)

  // Called when the form is submitted
  function handleAddExpense(event) {
    event.preventDefault()
    setError('')

    // Validation: name is required
    if (!name.trim()) {
      setError('Please enter an expense name.')
      return
    }

    // Validation: amount must be a number greater than 0
    const parsedAmount = Number(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }

    // Validation: date is required
    if (!date) {
      setError('Please choose a date.')
      return
    }

    // Create the new expense and add it to the top of the list
    const newExpense = {
      id: Date.now(),
      name: name.trim(),
      amount: parsedAmount,
      category,
      date,
    }
    setExpenses([newExpense, ...expenses])

    // Clear the form for the next entry
    setName('')
    setAmount('')
    setCategory('Food')
    setDate(new Date().toISOString().slice(0, 10))
  }

  // Called when a Delete button is clicked (with confirmation)
  function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter((e) => e.id !== id))
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Expense Tracker</h1>
        <p>Track your spending. Simple and saved on this device.</p>
      </header>

      {/* Summary cards */}
      <section className="summary">
        <div className="card summary-card">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-value">{formatMoney(totalExpenses)}</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Number of Expenses</span>
          <span className="summary-value">{numberOfExpenses}</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">This Month's Expenses</span>
          <span className="summary-value">{formatMoney(thisMonthTotal)}</span>
        </div>
      </section>

      {/* Add expense form */}
      <section className="card form-card">
        <h2>Add an Expense</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAddExpense}>
          <label>
            Expense Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </label>

          <label>
            Amount ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25.50"
            />
          </label>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <button type="submit" className="add-btn">Add Expense</button>
        </form>
      </section>

      {/* Expense list */}
      <section className="card list-card">
        <h2>Your Expenses</h2>
        {expenses.length === 0 ? (
          <p className="empty">No expenses yet. Add your first expense above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td><span className="badge">{expense.category}</span></td>
                  <td>{formatDate(expense.date)}</td>
                  <td>{formatMoney(expense.amount)}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(expense.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
