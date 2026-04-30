import axios from "axios";

export async function POST(req) {
  try {
    const { gstin } = await req.json();

    if (!gstin || gstin.length !== 15) {
      return Response.json({
        success: false,
        message: "Invalid GSTIN format",
      });
    }

    // 🔥 OPTION 1: Public GST API (example provider)
    const res = await axios.get(
      `https://appyflow.in/api/verifyGST?gstNo=${gstin}&key=YOUR_API_KEY`
    );

    const data = res.data;

    if (!data || data.error) {
      return Response.json({
        success: false,
        message: "GSTIN not found",
      });
    }

    return Response.json({
      success: true,
      gst: {
        name: data.taxpayerInfo.legalName,
        tradeName: data.taxpayerInfo.tradeName,
        state: data.taxpayerInfo.state,
        status: data.taxpayerInfo.status,
        gstin,
      },
    });
  } catch (err) {
    return Response.json({
      success: false,
      message: "GST verification failed",
    });
  }
}
