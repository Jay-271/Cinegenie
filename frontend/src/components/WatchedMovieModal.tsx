import {
  Modal,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";

interface WatchedMovieModalProps {
  open: boolean;
  onClose: () => void;
  movie: {
    Title?: string;
    Poster?: string;
    Year?: string;
    Plot?: string;
    Ratings?: Array<{Source: string, Value: string}>;
    [key: string]: any;
  };
  onLike: () => void;
  onDislike: () => void;
} // for npm run build

const WatchedMovieModal = ({ open, onClose, movie, onLike, onDislike }: WatchedMovieModalProps) => {
  if (!movie) return null;

  const imdbRating = movie.Ratings?.find(
    (r: {Source: string, Value: string}) => r.Source === "Internet Movie Database"
  );

  const rtRating = movie.Ratings?.find(
    (r: {Source: string, Value: string}) => r.Source === "Rotten Tomatoes"
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "#282c34",
          boxShadow: 24,
          borderRadius: 2,
          p: 2,
          textAlign: "center",
        }}
      >
        <Card sx={{ backgroundColor: "#282c34", borderRadius: "10px" }}>
          {movie.Poster && movie.Poster !== "N/A" ? (
            <CardMedia
              component="img"
              height="450"
              image={movie.Poster}
              alt={movie.Title}
            />
          ) : (
            <Box
              height={450}
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="#444"
            >
              <Typography variant="body1" color="white">
                No image available
              </Typography>
            </Box>
          )}

          <CardContent>
            <Typography
              sx={{ color: "white", fontWeight: "bold" }}
              variant="h6"
            >
              {movie.Title} ({movie.Year})
            </Typography>

            <Typography variant="body2" color="grey" gutterBottom>
              Genre(s): ({movie.Genre})
            </Typography>

            <Typography variant="body2" color="white" sx={{ mb: 1 }}>
              {movie.Plot !== "N/A" ? movie.Plot : "No plot available."}
            </Typography>

            {imdbRating && (
              <Typography variant="body2" color="white">
                IMDb: {imdbRating.Value}
              </Typography>
            )}
            {rtRating && (
              <Typography variant="body2" color="white">
                Rotten Tomatoes: {rtRating.Value}
              </Typography>
            )}

            <Typography variant="body2" sx={{ mt: 2, color: "white" }}>
              Did you like this movie?
            </Typography>

            <Box
              sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}
            >
              <Button variant="contained" color="success" onClick={onLike}>
                Yes
              </Button>
              <Button variant="contained" color="error" onClick={onDislike}>
                No
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
};

export default WatchedMovieModal;
