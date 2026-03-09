import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tags,
  Calendar,
  Info,
  Pencil,
  Loader2,
  Database,
  Hash,
} from "lucide-react";
import { categoryApi } from "../../api/categoryApi";
import Button from "../../components/UI/Button";

const ViewCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoryApi.getCategoryBySlug(slug);
        if (response.success) {
          setCategory(response.data);
        } else {
          setError("Category not found");
        }
      } catch (err) {
        setError("Failed to fetch category details");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  const getProfileUrl = (image) => {
    if (!image) return null;
    if (typeof image === "string") {
      try {
        if (image.startsWith("{")) {
          return JSON.parse(image).url;
        }
        return image;
      } catch (e) {
        return image;
      }
    }
    return image.url;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in font-['Outfit']">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="mt-5 text-text-secondary font-medium tracking-tight">
          Loading category details...
        </p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center p-10 animate-fade-in font-['Outfit']">
        <div className="bg-surface border border-red-500/20 p-8 rounded-2xl shadow-xl text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center shadow-inner">
            <Info size={32} />
          </div>
          <p className="text-xl font-bold text-red-500">
            {error || "Category not found"}
          </p>
          <Button
            onClick={() => navigate("/categories")}
            icon={ArrowLeft}
            variant="primary"
            fullWidth
          >
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = getProfileUrl(category.image);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-12">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/categories")}
        >
          Back to Categories
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Category Details
            </h1>
            <p className="text-text-secondary text-sm font-medium">
              Management and information for the{" "}
              <span className="text-primary font-bold">"{category.name}"</span>{" "}
              genre.
            </p>
          </div>
          <Button
            icon={Pencil}
            size="md"
            onClick={() => navigate(`/categories/edit/${category.slug}`)}
          >
            Edit Category
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Simplified Hero Section */}
        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Left: Image */}
            <div className="shrink-0">
              <div className="w-48 h-48 rounded-xl overflow-hidden border border-border shadow-md">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background text-text-secondary/50 flex items-center justify-center">
                    <Tags size={60} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Key Info */}
            <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                    {category.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${
                      category.is_active !== false
                        ? "bg-success-surface text-success border-success/20"
                        : "bg-error-surface text-error border-error/20"
                    }`}
                  >
                    {category.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="bg-background px-4 py-1.5 rounded-full border border-border flex items-center gap-2">
                    <Hash size={12} className="text-primary" />
                    <span className="text-xs font-bold text-text-secondary font-mono">
                      {category.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border w-full max-w-2xl">
                <div>
                  <p className="text-[0.65rem] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Resource Count
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {(category.count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Entry Created
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {category.updatedAt
                      ? new Date(category.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-surface border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-widest">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Detailed Description
          </h3>
          <div className="bg-background p-6 rounded-xl border border-border prose dark:prose-invert max-w-none">
            <div
              className="text-text-primary text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  category.description ||
                  "No classification details provided for this genre.",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory;
