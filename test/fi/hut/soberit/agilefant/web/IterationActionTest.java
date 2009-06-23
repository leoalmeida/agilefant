package fi.hut.soberit.agilefant.web;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.junit.Assert.assertEquals;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.Before;
import org.junit.Test;

import fi.hut.soberit.agilefant.business.IterationBusiness;
import fi.hut.soberit.agilefant.model.Iteration;

public class IterationActionTest {
    IterationAction iterationAction = new IterationAction();
    
    IterationBusiness iterationBusiness;
    
    @Before
    public void setUp() {
        iterationAction.setIterationId(1);
        iterationBusiness = createMock(IterationBusiness.class);
        iterationAction.setIterationBusiness(iterationBusiness);
    }
    
    @Test
    public void ajaxDelete_success() {
        iterationBusiness.delete(1);
        expect(iterationBusiness.retrieve(1)).andReturn(new Iteration());
        replay(iterationBusiness);
        
        assertEquals(CRUDAction.AJAX_SUCCESS, iterationAction.ajaxDelete());
        
        verify(iterationBusiness);    
    }
    
    @Test
    public void ajaxDelete_error() {
        expect(iterationBusiness.retrieve(1)).andReturn(null);
        replay(iterationBusiness);
        
        assertEquals(CRUDAction.AJAX_ERROR, iterationAction.ajaxDelete());
        
        verify(iterationBusiness);    
    }
    
    @Test
    public void ajaxDelete_forbidden() {
        iterationBusiness.delete(1);
        expectLastCall().andThrow(new ConstraintViolationException(null, null, null));
        expect(iterationBusiness.retrieve(1)).andReturn(new Iteration());
        replay(iterationBusiness);
        
        assertEquals(CRUDAction.AJAX_FORBIDDEN, iterationAction.ajaxDelete());
        
        verify(iterationBusiness); 
    }
}