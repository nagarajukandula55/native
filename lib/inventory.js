import mongoose from "mongoose"
import Inventory from "@/models/Inventory"

/* ================================
   🔒 RESERVE STOCK (ATOMIC)
================================ */
export async function reserveStock(items, warehouseId) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const warehouse = new mongoose.Types.ObjectId(warehouseId)

    for (const item of items) {
      const product = new mongoose.Types.ObjectId(item.productId)

      const result = await Inventory.updateOne(
        {
          product,
          warehouse,
          availableQty: { $gte: item.quantity },
        },
        {
          $inc: {
            availableQty: -item.quantity,
            reservedQty: item.quantity,
          },
        },
        { session }
      )

      if (result.modifiedCount === 0) {
        throw new Error(`❌ Not enough stock for product ${item.productId}`)
      }
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/* ================================
   🔄 RELEASE STOCK (CANCEL/FAIL)
================================ */
export async function releaseStock(items, warehouseId) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const warehouse = new mongoose.Types.ObjectId(warehouseId)

    for (const item of items) {
      const product = new mongoose.Types.ObjectId(item.productId)

      const result = await Inventory.updateOne(
        {
          product,
          warehouse,
          reservedQty: { $gte: item.quantity },
        },
        {
          $inc: {
            reservedQty: -item.quantity,
            availableQty: item.quantity,
          },
        },
        { session }
      )

      if (result.modifiedCount === 0) {
        throw new Error(`❌ Cannot release stock for ${item.productId}`)
      }
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/* ================================
   📦 SHIP STOCK
================================ */
export async function shipStock(items, warehouseId) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const warehouse = new mongoose.Types.ObjectId(warehouseId)

    for (const item of items) {
      const product = new mongoose.Types.ObjectId(item.productId)

      const result = await Inventory.updateOne(
        {
          product,
          warehouse,
          reservedQty: { $gte: item.quantity },
        },
        {
          $inc: {
            reservedQty: -item.quantity,
            shippedQty: item.quantity,
          },
        },
        { session }
      )

      if (result.modifiedCount === 0) {
        throw new Error(`❌ Cannot ship product ${item.productId}`)
      }
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/* ================================
   🚚 DELIVER STOCK
================================ */
export async function deliverStock(items, warehouseId) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const warehouse = new mongoose.Types.ObjectId(warehouseId)

    for (const item of items) {
      const product = new mongoose.Types.ObjectId(item.productId)

      const result = await Inventory.updateOne(
        {
          product,
          warehouse,
          shippedQty: { $gte: item.quantity },
        },
        {
          $inc: {
            shippedQty: -item.quantity,
          },
        },
        { session }
      )

      if (result.modifiedCount === 0) {
        throw new Error(`❌ Cannot deliver product ${item.productId}`)
      }
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}
