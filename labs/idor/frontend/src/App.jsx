import { useState, useEffect, useRef } from 'react'
import confetti from "@hiseb/confetti";
import axios from 'axios'
import './app.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const queryParams = new URLSearchParams(window.location.search)
  const id = queryParams.get('id')

  const handleCompleteClick = (e) => { 
    const rect = e.target.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y }
    })
  }


  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:8080/api/users/${id}`)
        setUser(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [id])

  if (loading) return <p className="loader">Loading secure records...</p>
  if (!user) return <p className="error">Error: Could not find user record</p>
  
  

  return (
    <>
      <div className="navbar"></div>
      <div className="portal-container">
        <h1>Bank</h1>
        <p className="subtitle">Account Overview & Cards</p>
        <div className="card-display">
          <div className="card-chip"></div>
          <div className="card-number">{user.card?.number || '•••• •••• •••• ••••'}</div>
          <div className="card-details">
            <div className="card-holder">
              <label>Cardholder</label>
              <div>{user.name}</div>
            </div>
            <div className="card-expiry">
              <label>Expires</label>
              <div>{user.card?.expires}</div>
            </div>
            <div className="card-cvv">
              <label>CVV</label>
              <div>{user.card?.cvv}</div>
            </div>
          </div>   {/* Credit Card Component */}
        </div>
        <div className="balance-box">
          <span>Available Balance:</span>
          <span className="balance-amount">${user.card?.balence}</span>
        </div>
        {Number(user.id) !== 2 && (
          <button className="submit-btn" onClick={handleCompleteClick}>
            Complete
          </button>
        )}
      </div>
    </>
  )
}

export default App
