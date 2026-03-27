export const templates = [
  {
    id: "food_front",
    name: "Food Front Label",
    elements: [
      {
        id: 1,
        type: "text",
        text: "BRAND NAME",
        x: 80,
        y: 40,
        width: 300,
        height: 50,
        fontSize: 32,
        color: "#111"
      },
      {
        id: 2,
        type: "text",
        text: "Premium Product",
        x: 80,
        y: 100,
        width: 200,
        height: 40,
        fontSize: 18,
        color: "#444"
      },
      {
        id: 3,
        type: "shape",
        x: 50,
        y: 30,
        width: 400,
        height: 120,
        color: "#facc15",
        borderRadius: 12
      }
    ]
  },

  {
    id: "food_back",
    name: "Food Back Label",
    elements: [
      {
        id: 1,
        type: "text",
        text: "Ingredients:",
        x: 40,
        y: 40,
        width: 200,
        height: 30,
        fontSize: 16,
        color: "#000"
      },
      {
        id: 2,
        type: "text",
        text: "Nutrition Facts",
        x: 40,
        y: 80,
        width: 200,
        height: 30,
        fontSize: 16,
        color: "#000"
      },
      {
        id: 3,
        type: "barcode",
        value: "123456789",
        x: 40,
        y: 150,
        width: 150,
        height: 60
      }
    ]
  }
];
