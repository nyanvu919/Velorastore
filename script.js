/* ============================================
   BỔ SUNG STYLE CHO BACKEND INTEGRATION
   ============================================ */

/* Order details in success modal */
.order-details {
  background: var(--light-color);
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.order-details p {
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
}

.order-details strong {
  color: var(--dark-color);
  min-width: 150px;
  display: inline-block;
}

.demo-note {
  margin-top: 15px;
  color: var(--error-color);
  font-size: 0.9rem;
  padding: 10px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 5px;
}

/* Test backend button */
#testBackendBtn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

/* Loading animation */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Backend status indicator */
.backend-status {
  position: fixed;
  bottom: 80px;
  left: 20px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 5px;
}

.backend-status.connected {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid #4CAF50;
}

.backend-status.disconnected {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
  border: 1px solid #F44336;
}

/* Account menu styles */
.account-menu .account-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.account-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-right: 15px;
}

.account-details h3 {
  margin-bottom: 5px;
}

.account-details p {
  color: var(--text-color);
  font-size: 0.9rem;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-action-btn {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid var(--border-color);
  background: none;
  border-radius: 5px;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
  width: 100%;
}

.account-action-btn:hover {
  background-color: var(--light-color);
  border-color: var(--primary-color);
}

.account-action-btn i {
  margin-right: 15px;
  color: var(--primary-color);
  width: 20px;
}
