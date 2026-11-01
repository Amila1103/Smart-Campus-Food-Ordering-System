import Cart from "../Model/CartModel.js";

// Cart items 1 පැයකට පස්සේ auto delete කරන system එක
const cartAutoCleaner = () => {
  setInterval(async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const carts = await Cart.find({});

      for (let cart of carts) {
        const freshItems = cart.items.filter(
          (item) => new Date(item.dateTime) > oneHourAgo
        );

        if (freshItems.length !== cart.items.length) {
          cart.items = freshItems;
          await cart.save();
          console.log("🧹 Cart auto cleaned:", cart.email);
        }
      }
    } catch (err) {
      console.error("❌ Cart auto clean error:", err.message);
    }
  }, 5 * 60 * 1000); // 5 minutes වලට එකවර run වෙනවා
};

export default cartAutoCleaner;