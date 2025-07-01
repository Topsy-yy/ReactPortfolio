// Create your Projects component here
import Project from '../assets/login.png'; // Make sure this path is correct for a placeholder image
import data from '../data/projects.json'; // Imports your project data
import Slider from "react-slick"; // Imports the Slider component
import "slick-carousel/slick/slick.css"; // Imports slick carousel base styles
import "slick-carousel/slick/slick-theme.css"; // Imports slick carousel theme styles

const Projects = () => {
  const settings = {
    dots: true,
    infinite: false,
    initialSlide: 0,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          infinite: false,
          initialSlide: 0,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div id='projects' className='projects'>
      <div className="heading">
        <h2>WORKS</h2>
      </div>
      <div className="projects-container">
        <Slider {...settings}>
          {data.map((project, key) => {
            return (
              <div key={key} className="project">
                <div className="content">
                  <img src={Project} alt="Project" /> {/* This image will be the same for all projects initially */}
                  <h2 className="name">{project.name}</h2>
                  {project.description.length > 130
                    ? <p className='description-min'>{project.description}</p>
                    : <p className='description'>{project.description}</p>
                  }
                  <div>
                    <a
                      className="project-button"
                      target="_blank"
                      href={project.link}
                      rel="noreferrer"
                    >GitHub</a>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}

export default Projects;