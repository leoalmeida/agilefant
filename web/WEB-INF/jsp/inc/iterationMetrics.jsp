<%@ include file="./_taglibs.jsp"%>
<table>
	<tr>
		<th>Velocity</th>
		<td><c:out value="${iterationMetrics.dailyVelocity}" /> / day</td>
	</tr>
	<c:if test="${iterationMetrics.backlogOngoing}">
		<tr>
			<th>Schedule variance</th>
			<td><c:choose>
				<c:when test="${iterationMetrics.scheduleVariance != null}">
					<c:choose>
						<c:when test="${iterationMetrics.scheduleVariance > 0}">
							<span class="red">+ 
						</c:when>
						<c:otherwise>
							<span>
						</c:otherwise>
					</c:choose>
					<c:out value="${iterationMetrics.scheduleVariance}" /> days
                     </c:when>
				<c:otherwise>
                         unknown
                     </c:otherwise>
			</c:choose></td>
		</tr>
		<tr>
			<th>Scoping needed</th>
			<td><c:choose>
				<c:when test="${iterationMetrics.scopingNeeded != null}">
					<c:out value="${iterationMetrics.scopingNeeded}" />
				</c:when>
				<c:otherwise>
                         unknown
                     </c:otherwise>
			</c:choose></td>
		</tr>
	</c:if>
	<tr>
		<th>Done</th>
		<td><c:out value="${iterationMetrics.percentDone}" />% (<c:out
			value="${iterationMetrics.completedItems}" /> / <c:out
			value="${iterationMetrics.totalItems}" />)</td>
	</tr>
</table>