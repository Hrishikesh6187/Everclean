import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Card,
  Typography,
  Box,
  Avatar,
  IconButton,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Delete, Image } from '@mui/icons-material';

interface Post {
  post_id: string;
  post_content: string;
  image_urls: string[] | null;
  created_at: string;
  freelancer_id: string;
  profile_photo: string | null;
  first_name: string;
  last_name: string;
  likes_count: number;
  comments_count: number;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const postsPerPage = 10;

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get the total count of posts
      const { count } = await supabase
        .from('post_details')
        .select('*', { count: 'exact', head: true });

      // Calculate total pages
      setTotalPages(Math.ceil((count || 0) / postsPerPage));

      // Fetch paginated posts
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * postsPerPage, page * postsPerPage - 1);

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      // First check if the post exists
      const { data: postData, error: fetchError } = await supabase
        .from('posts')
        .select('post_id')
        .eq('post_id', postToDelete)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!postData) {
        throw new Error('Post not found');
      }
      
      // Delete related comments first
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', postToDelete);
      
      if (commentsError) throw commentsError;
      
      // Delete related likes
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postToDelete);
      
      if (likesError) throw likesError;
      
      // Finally delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', postToDelete);
  
      if (error) throw error;
      
      // Refresh the posts list
      fetchPosts();
      
      // Show success message
      setSnackbarMessage('Post deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Close the dialog
      closeDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setSnackbarMessage(`Failed to delete post: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      closeDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading && posts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Manage Freelancer Posts
      </Typography>
      
      {posts.length === 0 ? (
        <Alert severity="info">No posts found.</Alert>
      ) : (
        <>
          {posts.map((post) => (
            <Card key={post.post_id} sx={{ mb: 3, p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box display="flex" gap={2}>
                  <Avatar src={post.profile_photo || undefined} />
                  <Box>
                    <Typography variant="h6">
                      {post.first_name} {post.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(post.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => openDeleteDialog(post.post_id)}
                  color="error"
                  aria-label="delete post"
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                {post.post_content}
              </Typography>
              
              {post.image_urls && post.image_urls.length > 0 && (
                <Box mt={2} mb={2}>
                  <img 
                    src={post.image_urls[0]} 
                    alt="Post" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      borderRadius: '8px' 
                    }} 
                  />
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    {post.likes_count} likes
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    {post.comments_count} comments
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeletePost} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}