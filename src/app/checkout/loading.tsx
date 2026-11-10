import React from "react";
import { Header } from "@/components/layout/Shared";

// Shown instantly when someone taps Checkout, while the page loads.
export default function CheckoutLoading() {
  return (
    <div className="screen checkout-screen">
      <Header />
      <div className="wrap ck-wrap">
        <div className="ck-steps">
          <span className="ck-step is-on">1 · Cart</span>
          <span className="ck-step is-cur">2 · Checkout</span>
          <span className="ck-step">3 · Done</span>
        </div>
        <div className="ck-grid ck-two-col" aria-busy="true" aria-label="Loading checkout">
          <div className="ck-forms">
            {[0, 1, 2].map((i) => (
              <section className="ck-block sk-block" key={i}>
                <span className="sk sk-title" />
                <span className="sk sk-line" /><span className="sk sk-line" /><span className="sk sk-line short" />
              </section>
            ))}
          </div>
          <aside className="summary">
            <span className="sk sk-title" />
            <span className="sk sk-line" /><span className="sk sk-line" /><span className="sk sk-btn" />
          </aside>
        </div>
      </div>
    </div>
  );
}
