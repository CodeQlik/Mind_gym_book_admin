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
        <div className="bg-surface border border-red-500/20 p-8 rounded-[2rem] shadow-xl text-center flex flex-col items-center gap-6 max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center shadow-inner">
            <Info size={40} />
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
    <div className="flex flex-col gap-8 animate-fade-in font-['Outfit'] pb-12">
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/categories")}
        >
          Back to Categories
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-text-primary italic tracking-tight">
              Category Details
            </h1>
            <p className="text-text-secondary mt-1 font-medium tracking-tight">
              Detailed information about the{" "}
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

      <div className="flex flex-col gap-10">
        {/* Premium Hero Section */}
        <div className="bg-surface border border-border p-10 sm:p-12 rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
            {/* Left: Image */}
            <div className="relative shrink-0">
              <div className="w-64 h-64 rounded-[2.5rem] overflow-hidden border-8 border-background shadow-2xl transition-transform duration-700 group-hover:scale-105">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background text-text-secondary/50 flex items-center justify-center">
                    <Tags size={80} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="absolute -inset-4 bg-primary/5 rounded-full -z-10 blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Middle: Key Info */}
            <div className="flex-1 flex flex-col gap-8 text-center lg:text-left py-2">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-black text-text-primary italic tracking-tight leading-none">
                  {category.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <span
                    className={`px-5 py-2 rounded-full text-[0.7rem] font-black uppercase tracking-[0.2em] border shadow-sm ${
                      category.is_active !== false
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    }`}
                  >
                    {category.is_active !== false
                      ? "● Active Status"
                      : "● Inactive Status"}
                  </span>

                  <div className="bg-background px-5 py-2 rounded-full border border-border flex items-center gap-2">
                    <Hash size={14} className="text-primary" />
                    <span className="text-[0.8rem] font-bold text-text-secondary font-mono">
                      {category.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center lg:justify-start gap-12 pt-6 border-t border-border">
                <div>
                  <p className="text-[0.65rem] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">
                    Resource Count
                  </p>
                  <p className="text-4xl font-black text-primary">
                    {(category.count || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Management Logs */}
            <div className="flex gap-6 lg:border-l lg:border-border lg:pl-12 lg:py-2">
              <div className="flex flex-col gap-8 justify-center">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest mb-0.5">
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
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-500/20">
                    <Database size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[0.6rem] font-black text-text-secondary uppercase tracking-widest mb-0.5">
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
        </div>

        {/* Secondary Info Grid - Description Full Width */}
        <div className="w-full h-full">
          {/* Description Card */}
          <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-sm flex flex-col h-full">
            <h3 className="text-[0.75rem] font-black text-primary mb-8 flex items-center gap-3 uppercase tracking-[0.25em]">
              <span className="w-1.5 h-5 bg-primary rounded-full"></span>
              Detailed Description
            </h3>
            <div className="bg-background p-8 rounded-3xl border border-dashed border-border flex-1">
              <p className="text-text-primary font-medium leading-relaxed italic text-lg">
                {category.description ||
                  "No classification details provided for this genre."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory;
