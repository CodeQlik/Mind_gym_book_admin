import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Save, Upload, Music, User, Globe, Clock, CheckCircle2, Headphones } from "lucide-react";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { updateAudiobook, fetchAudiobooks } from "../../store/slices/audiobookSlice";
import { fetchBooks } from "../../store/slices/bookSlice";
import { toast } from "react-hot-toast";

const EditAudiobook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { audiobooks, loading } = useSelector((state) => state.audiobooks);
  const { books } = useSelector((state) => state.books);
  const [audioPreview, setAudioPreview] = useState(null);

  const audiobookToEdit = audiobooks.find((a) => String(a.id) === String(id));

  useEffect(() => {
    if (audiobooks.length === 0) {
      dispatch(fetchAudiobooks({ page: 1, limit: 100 }));
    }
    if (books.length === 0) {
      dispatch(fetchBooks({ page: 1, limit: 1000 }));
    }
  }, [dispatch, audiobooks.length, books.length]);

  const bookOptions = (Array.isArray(books) ? books : []).map(book => ({
    value: book.id,
    label: book.title
  }));

  const validationSchema = Yup.object().shape({
    book_id: Yup.string().required("Please select a book"),
    chapter_number: Yup.number().required("Chapter number is required").min(1, "Minimum chapter number is 1"),
    chapter_title: Yup.string().required("Chapter title is required"),
    narrator: Yup.string().required("Narrator name is required"),
    language: Yup.string().required("Language is required"),
  });

  const formik = useFormik({
    initialValues: {
      book_id: audiobookToEdit?.book_id || "",
      chapter_number: audiobookToEdit?.chapter_number || "",
      chapter_title: audiobookToEdit?.chapter_title || "",
      narrator: audiobookToEdit?.narrator || "",
      language: audiobookToEdit?.language || "Hindi",
      audio_file: null,
      status: audiobookToEdit?.status ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("book_id", values.book_id);
      formData.append("chapter_number", values.chapter_number);
      formData.append("chapter_title", values.chapter_title);
      formData.append("narrator", values.narrator);
      formData.append("language", values.language);
      if (values.audio_file) {
        formData.append("audio_file", values.audio_file);
      }
      formData.append("status", values.status);

      try {
        const resultAction = await dispatch(updateAudiobook({ id, formData }));
        if (updateAudiobook.fulfilled.match(resultAction)) {
          toast.success("Audiobook updated successfully");
          navigate("/audiobooks");
        } else {
          toast.error(resultAction.payload || "Failed to update audiobook");
        }
      } catch (error) {
        toast.error("Internal Server error");
      }
    },
  });

  const handleAudioChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast.error("Please upload a valid audio file");
        return;
      }
      formik.setFieldValue("audio_file", file);
      setAudioPreview(file.name);
    }
  };

  if (!audiobookToEdit && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-text-secondary font-bold">Audiobook not found</p>
        <Button onClick={() => navigate("/audiobooks")} className="mt-4">Back to List</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in font-['Outfit'] pb-10">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="w-fit"
          onClick={() => navigate("/audiobooks")}
        >
          Back to List
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Edit Audiobook
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Update the audio version details for your book.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Form */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit}>
            <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Associated Book"
                  name="book_id"
                  type="select"
                  options={bookOptions}
                  value={formik.values.book_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.book_id && formik.errors.book_id}
                  placeholder="Select a book..."
                  required
                />
                <FormInput
                  label="Narrator Name"
                  name="narrator"
                  icon={User}
                  value={formik.values.narrator}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.narrator && formik.errors.narrator}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Chapter Number"
                  name="chapter_number"
                  type="number"
                  value={formik.values.chapter_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.chapter_number && formik.errors.chapter_number}
                  placeholder="e.g. 1"
                  required
                />
                <FormInput
                  label="Chapter Title"
                  name="chapter_title"
                  value={formik.values.chapter_title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.chapter_title && formik.errors.chapter_title}
                  placeholder="e.g. Introduction"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                  label="Language"
                  name="language"
                  icon={Globe}
                  value={formik.values.language}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.language && formik.errors.language}
                  placeholder="e.g. English, Hindi"
                  required
                />
                <div className="flex flex-col gap-2 justify-end pb-1.5">
                   <label className="text-sm font-bold text-text-primary">Status</label>
                   <div className="flex items-center gap-3 h-[45px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="status"
                          className="sr-only peer"
                          checked={formik.values.status}
                          onChange={formik.handleChange}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                        <span className="ml-3 text-sm font-bold text-text-primary uppercase tracking-wider">
                          {formik.values.status ? "Active" : "Inactive"}
                        </span>
                      </label>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-text-primary block">Update Audio File (Optional)</label>
                <label 
                  htmlFor="audio-upload"
                  className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5"
                >
                  <input 
                    id="audio-upload"
                    type="file" 
                    className="hidden" 
                    accept="audio/*"
                    onChange={handleAudioChange}
                  />
                  {audioPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <Music size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">{audioPreview}</p>
                        <p className="text-[11px] text-success font-bold uppercase mt-1 flex items-center gap-1 justify-center">
                          <CheckCircle2 size={12} /> Ready to replace
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-text-primary">Click to replace audio</p>
                      {audiobookToEdit?.audio_file?.url && (
                        <div className="mt-2 p-2 bg-surface rounded-lg border border-border">
                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-1">Current Audio File:</p>
                            <a 
                              href={audiobookToEdit.audio_file.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-primary font-bold hover:underline break-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {audiobookToEdit.audio_file.url}
                            </a>
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                <Button
                  type="submit"
                  icon={Save}
                  loading={loading}
                  className="flex-1"
                >
                  Update Audiobook
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => navigate("/audiobooks")}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar: All Chapters of this Book */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm sticky top-6">
            <div className="bg-primary/5 p-4 border-b border-border">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                <Headphones size={16} /> All Chapters ({audiobookToEdit?.book?.title})
              </h3>
            </div>
            <div className="p-2 max-h-[600px] overflow-y-auto">
              {(Array.isArray(audiobooks) ? audiobooks : [])
                .filter(a => a.book_id === audiobookToEdit?.book_id)
                .sort((a,b) => a.chapter_number - b.chapter_number)
                .map((chapter) => (
                <div 
                  key={chapter.id}
                  onClick={() => {
                    navigate(`/audiobooks/edit/${chapter.id}`);
                    setAudioPreview(null);
                  }}
                  className={`p-3 rounded-xl mb-1 cursor-pointer transition-all border ${
                    String(chapter.id) === String(id) 
                    ? "bg-primary/10 border-primary shadow-sm" 
                    : "hover:bg-primary/5 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      String(chapter.id) === String(id) ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      CH {chapter.chapter_number}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${chapter.status ? "text-success" : "text-error"}`}>
                      {chapter.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-text-primary line-clamp-1 mb-1">
                    {chapter.chapter_title}
                  </p>
                  <a 
                    href={chapter.audio_file?.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1 font-medium truncate"
                  >
                    <Music size={10} /> View Audio URL
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAudiobook;
