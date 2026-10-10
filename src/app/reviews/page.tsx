"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";

interface PublicReview {
  id: string;
  client_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: "",
    rating: 0,
    review_text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/public/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    if (formData.rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({ client_name: "", rating: 0, review_text: "" });
        setTimeout(() => {
          setIsFormOpen(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError(data.error || "Failed to submit review.");
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1 text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`focus:outline-none ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= rating ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageHero 
        compact={true}
        eyebrow="Client reviews" 
        title="Trust is earned in the details." 
        copy="We value every client’s confidence. Verified testimonials from our clients." 
      />
      
      <section className="px-5 py-12 sm:px-8 lg:py-16 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#09295a]">Customer Reviews</h2>
            {!isLoading && reviews.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                {renderStars(Math.round(Number(averageRating)))}
                <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-[#126ce5] text-white font-bold rounded-xl hover:bg-[#0e5bc0] transition-colors shadow-sm"
          >
            Write a Review
          </button>
        </div>

        {isFormOpen && (
          <div className="mb-12 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#09295a] mb-6">Write a Review</h3>
            
            {submitSuccess ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Icon name="check" className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-lg mb-1">Thank you!</h4>
                <p>Your review has been submitted and is pending approval.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                {submitError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                    {submitError}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-2">Your Rating *</label>
                  {renderStars(formData.rating, true)}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-2">Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none focus:bg-white transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#09295a] mb-2">Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#126ce5] focus:outline-none focus:bg-white transition-colors resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-[#09295a] text-white font-bold rounded-xl hover:bg-[#126ce5] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitting && <Icon name="spinner" className="w-4 h-4 animate-spin" />}
                    Submit Review
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Note: Your review will be visible to the public once it is approved by our team.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <Icon name="spinner" className="w-8 h-8 animate-spin text-[#126ce5] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-[#f4f9ff] px-7 py-14 text-center sm:px-14">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#126ce5] shadow-sm">
              <Icon name="chat" className="h-5 w-5" />
            </span>
            <h2 className="mt-6 text-3xl font-black tracking-[-.05em] text-[#09295a]">Be the first to review us.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#62728a]">
              We value every client’s confidence. Please share your experience with us.
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#09295a] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#126ce5]"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  {renderStars(review.rating)}
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 flex-1 italic">
                  "{review.review_text}"
                </p>
                <div className="font-bold text-[#09295a] border-t border-gray-50 pt-4">
                  {review.client_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
