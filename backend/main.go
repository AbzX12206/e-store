package main

import (
	"fmt"
	"log"
	"net/http"

	"e-store-backend/handlers"
)

func main() {
	// API routes
	http.HandleFunc("/api/chat/tree", handlers.ChatTreeHandler)
	http.HandleFunc("/api/upload", handlers.UploadHandler)

	// Static file serving for uploads
	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// Health check
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write([]byte(`{"status":"ok"}`))
	})

	port := ":8080"
	fmt.Printf("🚀 Server starting on http://localhost%s\n", port)
	fmt.Println("📁 Upload endpoint: POST /api/upload")
	fmt.Println("💬 Chatbot endpoint: GET /api/chat/tree")
	
	log.Fatal(http.ListenAndServe(port, nil))
}
