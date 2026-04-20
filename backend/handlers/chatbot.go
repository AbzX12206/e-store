package handlers

import (
	"encoding/json"
	"net/http"

	"e-store-backend/data"
)

// ChatTreeHandler returns the chatbot decision tree as JSON
func ChatTreeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	response := map[string]interface{}{
		"tree": data.ChatTree,
	}

	json.NewEncoder(w).Encode(response)
}
