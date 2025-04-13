import { Box, Typography, CircularProgress } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function MyCarousel() {
  const [hotItems, setHotItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleItemClick = (id) => {
    navigate(`/product/${id}`);
  };

  useEffect(() => {
    const fetchHotItems = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products?hot=true"
        );
        const data = await response.json();
        if (data.success) {
          setHotItems(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("获取热门商品失败");
      } finally {
        setLoading(false);
      }
    };

    fetchHotItems();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          width: "1312px",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          width: "1312px",
          color: "white",
        }}
      >
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      <Box
        sx={{
          marginTop: "2px",
          width: "1312px",
        }}
      >
        <Carousel
          animation="slide"
          navButtonsAlwaysVisible
          duration={800}
          indicators={hotItems.length > 1}
          navButtonsProps={{
            style: {
              backgroundColor: "rgba(255, 215, 0, 0.3)",
              color: "#FFD700",
            },
          }}
        >
          {hotItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                textAlign: "left",
                cursor: "pointer",
              }}
              onClick={() => handleItemClick(item.id)}
            >
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: 20,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  transform: "none",
                  color: "white",
                  padding: 1,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: "0.8em" }}>
                  floor: {Number(item.price).toFixed(3)} ETH
                </span>
              </Typography>
            </Box>
          ))}
        </Carousel>
      </Box>{" "}
    </div>
  );
}
