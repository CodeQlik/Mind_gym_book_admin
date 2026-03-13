import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Save, Upload, Music, User, Globe, Clock, CheckCircle2, Trash2 } from "lucide-react";
import FormInput from "../../components/Form/FormInput";
import Button from "../../components/UI/Button";
import { useDispatch, useSelector } from "react-redux";
import { createAudiobook } from "../../store/slices/audiobookSlice";
import { fetchBooks } from "../../store/slices/bookSlice";
import { toast } from "react-hot-toast";

const AddAudiobook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { audiobooks, loading } = useSelector((state) => state.audiobooks);
  const { books } = useSelector((state) => state.books);
  const [audioPreviews, setAudioPreviews] = useState([]); // Array of { file, title, number }
  const [isBulk, setIsBulk] = useState(false);
  const [lastChapterNum, setLastChapterNum] = useState(0);

  // Pre-fill book if passed from state
  const initialBookId = location.state?.bookId || "";

  useEffect(() => {
    dispatch(fetchBooks({ page: 1, limit: 1000 }));
  }, [dispatch]);



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
    audio_files: Yup.mixed().required("At least one audio file is required"),
  });

  const formik = useFormik({
    initialValues: {
      book_id: initialBookId,
      chapter_number: "",
      chapter_title: "",
      narrator: "",
      language: "Hindi",
      audio_files: null,
      status: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("book_id", values.book_id);
      formData.append("narrator", values.narrator);
      formData.append("language", values.language);
      
      if (isBulk) {
        // Bulk Upload with custom titles and numbers
        audioPreviews.forEach((item, index) => {
          formData.append("audio_files", item.file);
          formData.append("chapter_numbers", item.number);
          formData.append("chapter_titles", item.title);
        });
      } else {
        // Single Upload
        const singleFile = audioPreviews[0]?.file;
        if (singleFile) {
          formData.append("audio_file", singleFile);
          formData.append("chapter_number", values.chapter_number);
          formData.append("chapter_title", values.chapter_title);
        }
      }

      formData.append("status", values.status);

      try {
        const resultAction = await dispatch(createAudiobook(formData));
        if (createAudiobook.fulfilled.match(resultAction)) {
          toast.success("Audiobook added successfully");
          navigate("/audiobooks");
        } else {
          toast.error(resultAction.payload || "Failed to add audiobook");
        }
      } catch (error) {
        toast.error("Internal Server error");
      }
    },
  });

  // Fetch last chapter number when book changes
  useEffect(() => {
    if (formik.values.book_id && Array.isArray(audiobooks)) {
        const bookAudiobooks = audiobooks.filter(a => a.book_id == formik.values.book_id);
        if (bookAudiobooks.length > 0) {
            const max = Math.max(...bookAudiobooks.map(a => a.chapter_number));
            setLastChapterNum(max);
        } else {
            setLastChapterNum(0);
        }
    }
  }, [formik.values.book_id, audiobooks]);

  const handleAudioChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => file.type.startsWith("audio/"));
      if (validFiles.length !== files.length) {
        toast.error("Some files were skipped. Please upload only valid audio files.");
      }
      
      if (validFiles.length === 0) return;

      setAudioPreviews(prev => {
        const nextStartNum = prev.length > 0 
          ? Math.max(...prev.map(p => parseInt(p.number) || 0)) + 1 
          : lastChapterNum + 1;

        const newItems = validFiles.map((file, index) => ({
          file,
          title: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '),
          number: nextStartNum + index
        }));

        const updated = [...prev, ...newItems];
        setIsBulk(updated.length > 1);
        formik.setFieldValue("audio_files", updated.map(u => u.file));
        
        if (updated.length === 1) {
            formik.setFieldValue("chapter_number", updated[0].number);
            formik.setFieldValue("chapter_title", updated[0].title);
        }
        return updated;
      });
      
      event.target.value = '';
    }
  };

  const updateBulkMetadata = (index, field, value) => {
    const updated = [...audioPreviews];
    updated[index][field] = value;
    setAudioPreviews(updated);
  };

  const removeFile = (index) => {
      const updated = audioPreviews.filter((_, i) => i !== index);
      setAudioPreviews(updated);
      setIsBulk(updated.length > 1);
      if (updated.length === 0) formik.setFieldValue("audio_files", null);
  };

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
            Add New Audiobook
          </h1>
          <p className="text-text-secondary text-sm font-medium">
            Link an audio version to an existing book in your library.
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Select Book"
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

          {!isBulk && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
          )}

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
            <label className="text-sm font-bold text-text-primary block">
              Audio File(s) (MP3/WAV) - {isBulk ? "Bulk Mode Active" : "Single Upload"}
            </label>
            
            <label 
              htmlFor="audio-upload"
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer ${
                formik.touched.audio_files && formik.errors.audio_files && audioPreviews.length === 0
                ? "border-error bg-error/5" 
                : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input 
                id="audio-upload"
                type="file" 
                className="hidden" 
                accept="audio/*"
                multiple
                onChange={handleAudioChange}
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-text-primary">Click to {audioPreviews.length > 0 ? "Change Files" : "Upload Audio"}</p>
                <p className="text-sm text-text-secondary mt-1">Select one or multiple files for bulk upload</p>
              </div>
            </label>

            {audioPreviews.length > 0 && (
              <div className="mt-6 border border-border rounded-xl overflow-hidden bg-background">
                <div className="p-3 bg-surface border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider flex justify-between items-center">
                   <span>Selected Chapters ({audioPreviews.length})</span>
                   <span className="text-[10px] text-primary">Edit titles & numbers below</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface/50 border-b border-border">
                        <th className="px-4 py-2 text-[10px] font-bold text-text-secondary uppercase w-16">Ch #</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-text-secondary uppercase">Chapter Title</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-text-secondary uppercase w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {audioPreviews.map((item, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                          <td className="px-4 py-3 w-20">
                            <span className="inline-flex items-center justify-center w-10 h-8 bg-surface border border-border rounded text-sm font-bold text-text-primary">
                              {item.number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="text"
                              className="w-full bg-surface border border-border rounded px-2 py-1 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                              value={item.title}
                              onChange={(e) => updateBulkMetadata(index, 'title', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              type="button" 
                              onClick={() => removeFile(index)}
                              className="text-error hover:bg-error/10 p-1 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {formik.touched.audio_files && formik.errors.audio_files && audioPreviews.length === 0 && (
              <p className="text-error text-xs font-bold mt-1 ml-1">{formik.errors.audio_files}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button
              type="submit"
              icon={Save}
              loading={loading}
              className="flex-1"
            >
              {isBulk ? `Upload ${audioPreviews.length} Chapters` : "Save Audiobook"}
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
  );
};

export default AddAudiobook;
