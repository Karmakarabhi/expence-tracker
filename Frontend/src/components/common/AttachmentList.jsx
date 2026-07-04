import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, Loader2, FileText, Image } from 'lucide-react';

const categoryLabels = {
  purchase_invoice: '🧾 Purchase Invoice',
  deposit_slip: '✓ Deposit Slip',
  other: '📎 Other',
};

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <FileText className="w-5 h-5 text-gray-500" />;
};

export default function AttachmentList({ relatedModel, relatedId }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAttachments();
  }, [relatedModel, relatedId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attachments/${relatedModel}/${relatedId}`);
      setAttachments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      // Silently fail if no attachments found
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await api.get(`/attachments/${attachment._id}/download`, {
        responseType: 'blob',
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (attachment) => {
    if (!confirm(`Delete ${attachment.originalName}?`)) return;

    try {
      setDeleting(attachment._id);
      await api.delete(`/attachments/${attachment._id}`);
      toast.success('Attachment deleted');
      setAttachments(attachments.filter(a => a._id !== attachment._id));
    } catch (error) {
      toast.error('Failed to delete attachment');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
        Loading attachments...
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No attachments yet
      </div>
    );
  }

  // Group by category
  const grouped = attachments.reduce((acc, att) => {
    if (!acc[att.category]) {
      acc[att.category] = [];
    }
    acc[att.category].push(att);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category} className="p-4">
          <h4 className="font-semibold text-sm mb-3">{categoryLabels[category] || category}</h4>
          <div className="space-y-2">
            {items.map((attachment) => (
              <div
                key={attachment._id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.mimeType)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.sizeBytes / 1024).toFixed(1)} KB
                      {attachment.uploadedAt && 
                        ` • ${new Date(attachment.uploadedAt).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <Button
                    onClick={() => handleDownload(attachment)}
                    variant="ghost"
                    size="sm"
                    disabled={deleting === attachment._id}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(attachment)}
                    variant="ghost"
                    size="sm"
                    disabled={deleting === attachment._id}
                    className="text-destructive hover:text-destructive/90"
                  >
                    {deleting === attachment._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
