package data

// ChatNode represents a single node in the chatbot decision tree
type ChatNode struct {
	ID             string          `json:"id"`
	Message        string          `json:"message"`
	Options        []ChatOption    `json:"options,omitempty"`
	Recommendation *Recommendation `json:"recommendation,omitempty"`
}

// ChatOption represents a user choice leading to another node
type ChatOption struct {
	Label  string `json:"label"`
	NextID string `json:"nextId"`
}

// Recommendation represents a final product suggestion
type Recommendation struct {
	ProductID string `json:"productId"`
	Text      string `json:"text"`
}

// ChatTree contains all chatbot nodes
var ChatTree = map[string]ChatNode{
	"start": {
		ID:      "start",
		Message: "Hi there! 👋 I'm the RUX assistant. I can help you find the perfect item. Who are you shopping for?",
		Options: []ChatOption{
			{Label: "🙋 Myself", NextID: "self_type"},
			{Label: "🎁 A gift", NextID: "gift_type"},
			{Label: "🏢 My team/company", NextID: "team_type"},
		},
	},
	// Self path
	"self_type": {
		ID:      "self_type",
		Message: "Great taste starts here! What kind of item are you looking for?",
		Options: []ChatOption{
			{Label: "👕 T-Shirt", NextID: "rec_tshirt"},
			{Label: "🧥 Hoodie", NextID: "rec_hoodie"},
			{Label: "👔 Sweatshirt", NextID: "rec_sweatshirt"},
			{Label: "🧢 Cap", NextID: "rec_cap"},
			{Label: "☕ Mug", NextID: "rec_mug"},
			{Label: "📓 Notebook", NextID: "rec_notebook"},
		},
	},
	// Gift path
	"gift_type": {
		ID:      "gift_type",
		Message: "Awesome, gifts are our specialty! What's the vibe you're going for?",
		Options: []ChatOption{
			{Label: "😎 Something cool to wear", NextID: "gift_wearable"},
			{Label: "🎨 Something creative & personal", NextID: "gift_creative"},
			{Label: "🤷 Not sure, surprise me!", NextID: "rec_hoodie"},
		},
	},
	"gift_wearable": {
		ID:      "gift_wearable",
		Message: "Nice! Wearables are always a hit. What fits best?",
		Options: []ChatOption{
			{Label: "👕 Classic T-Shirt", NextID: "rec_tshirt"},
			{Label: "🧥 Cozy Hoodie", NextID: "rec_hoodie"},
			{Label: "🧢 Stylish Cap", NextID: "rec_cap"},
		},
	},
	"gift_creative": {
		ID:      "gift_creative",
		Message: "Creative gifts are the best! Something for the desk or the kitchen?",
		Options: []ChatOption{
			{Label: "☕ Custom Mug", NextID: "rec_mug"},
			{Label: "📓 Custom Notebook", NextID: "rec_notebook"},
		},
	},
	// Team path
	"team_type": {
		ID:      "team_type",
		Message: "Team merch! 🔥 Matching outfits or branded accessories?",
		Options: []ChatOption{
			{Label: "👕 Team T-Shirts", NextID: "rec_tshirt"},
			{Label: "🧥 Team Hoodies", NextID: "rec_hoodie"},
				{Label: "☕ Branded Mugs", NextID: "rec_mug"},
		},
	},
	// Recommendations
	"rec_tshirt": {
		ID:      "rec_tshirt",
		Message: "Perfect pick! Our Classic Tee is a bestseller — soft cotton, vivid prints.",
		Recommendation: &Recommendation{
			ProductID: "tshirt-classic",
			Text:      "👕 Customize Classic Tee — 10 990 ₸",
		},
	},
	"rec_hoodie": {
		ID:      "rec_hoodie",
		Message: "The Premium Hoodie is chef's kiss 🤌 — heavyweight, comfy, and looks amazing with custom designs.",
		Recommendation: &Recommendation{
			ProductID: "hoodie-premium",
			Text:      "🧥 Customize Premium Hoodie — 18 990 ₸",
		},
	},
	"rec_cap": {
		ID:      "rec_cap",
		Message: "Snapback Cap — structured, bold, and fully customizable. A real head-turner!",
		Recommendation: &Recommendation{
			ProductID: "cap-snapback",
			Text:      "🧢 Customize Snapback Cap — 5 990 ₸",
		},
	},
	"rec_mug": {
		ID:      "rec_mug",
		Message: "Our Ceramic Mug is a daily dose of your creativity. Glossy finish, dishwasher safe!",
		Recommendation: &Recommendation{
			ProductID: "mug-ceramic",
			Text:      "☕ Customize Ceramic Mug — 4 990 ₸",
		},
	},
	"rec_notebook": {
		ID:      "rec_notebook",
		Message: "The Hardcover Notebook is perfect for creatives. Your cover, your rules.",
		Recommendation: &Recommendation{
			ProductID: "notebook-hardcover",
			Text:      "📓 Customize Hardcover Notebook — 2 000 ₸",
		},
	},
}
