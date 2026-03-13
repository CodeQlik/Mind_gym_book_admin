import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Headphones, Pencil, Trash2, Music, Plus } from "lucide-react";
import Button from "../../components/UI/Button";
import Table from "../../components/Table/Table";
import { fetchAudiobooks, deleteAudiobook, toggleAudiobookStatus } from "../../store/slices/audiobookSlice";
import { toast } from "react-hot-toast";

const BookAudiobooks = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { audiobooks, loading } = useSelector((state) => state.audiobooks);

    useEffect(() => {
        dispatch(fetchAudiobooks({ page: 1, limit: 1000 }));
    }, [dispatch]);

    const bookObject = (Array.isArray(audiobooks) ? audiobooks : [])
        .find(a => String(a.id) === String(bookId));
        
    const bookChapters = [...(bookObject?.chapters || [])]
        .sort((a, b) => a.chapter_number - b.chapter_number);

    const bookTitle = bookObject?.title || "Book Chapters";

    const handleStatusToggle = async (id) => {
        try {
            const resultAction = await dispatch(toggleAudiobookStatus(id));
            if (toggleAudiobookStatus.fulfilled.match(resultAction)) {
                toast.success("Status updated successfully");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this chapter?")) {
            try {
                await dispatch(deleteAudiobook(id));
                toast.success("Chapter deleted");
            } catch (err) {
                toast.error("Failed to delete");
            }
        }
    };

    const columns = [
        {
            header: "Ch #",
            width: "80px",
            render: (row) => (
                <span className="font-bold text-primary">CH {row.chapter_number}</span>
            )
        },
        {
            header: "Chapter Title",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-text-primary text-sm">{row.title}</span>
                </div>
            )
        },
        {
            header: "Narrator",
            render: (row) => <span className="text-sm text-text-secondary">{row.narrator}</span>
        },
        {
            header: "Status",
            render: (row) => (
                <button
                    onClick={() => handleStatusToggle(row.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        row.status
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                            : "bg-error/10 text-error border-error/20 hover:bg-error/20"
                    }`}
                >
                    {row.status ? "Active" : "Inactive"}
                </button>
            )
        },
        {
            header: "Actions",
            width: "120px",
            align: "right",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-success/10 text-text-secondary hover:text-success transition-all border border-border"
                        title="Edit Chapter (Change URL)"
                        onClick={() => navigate(`/audiobooks/edit/${row.id}`)}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-error-surface text-text-secondary hover:text-error transition-all border border-border"
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10 font-['Inter']">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowLeft}
                    className="w-fit"
                    onClick={() => navigate("/audiobooks")}
                >
                    Back to Selection
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                        <Headphones size={24} className="text-primary" />
                        {bookTitle} - All Chapters
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Manage individual chapters and audio files for this book.
                    </p>
                </div>
                <Button 
                    onClick={() => navigate("/audiobooks/add", { state: { bookId } })}
                    className="sm:ml-auto"
                >
                    <Plus size={16} className="mr-2" />
                    Add More Chapters
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
                <Table
                    columns={columns}
                    data={bookChapters}
                    loading={loading}
                    emptyMessage="No chapters found for this book."
                />
            </div>
        </div>
    );
};

export default BookAudiobooks;
