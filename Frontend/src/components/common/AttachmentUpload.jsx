import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';

export default function AttachmentUpload({ relatedModel, relatedId, category, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category || 'purchase_invoice');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        toast.error('Only images and PDF files are allowed (max 10MB)');
        return;
      }
      setSelectedFile(acceptedFiles[0]);
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!relatedModel || !relatedId) {
      toast.error('Related record information is missing');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('relatedModel', relatedModel);
    formData.append('relatedId', relatedId);
    formData.append('category', selectedCategory);

    try {
      setUploading(true);
      const response = await api.post('/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div>
        <Label className="mb-2 block">Attachment Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={uploading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purchase_invoice">Purchase Invoice</SelectItem>
            <SelectItem value="deposit_slip">Deposit Slip</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop the file here' : 'Drag and drop a file here'}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to select (JPEG, PNG, PDF up to 10MB)
        </p>
      </div>

      {selectedFile && (
        <div className="p-3 bg-secondary rounded flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button
            onClick={() => setSelectedFile(null)}
            variant="ghost"
            size="sm"
            disabled={uploading}
          >
            Remove
          </Button>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </>
        )}
      </Button>
    </div>
  );
}
